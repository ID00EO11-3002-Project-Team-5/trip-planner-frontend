import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense } from '@/lib/apiClient';

/**
 * Export expenses to CSV format
 */
export function exportExpensesToCSV(expenses: Expense[], tripTitle: string = 'Trip') {
  const headers = ['Date', 'Title', 'Amount', 'Currency', 'Participants', 'Payers'];
  
  const rows = expenses.map(exp => [
    new Date(exp.createdat_expe).toLocaleDateString(),
    exp.title_expe,
    exp.amount_expe.toFixed(2),
    exp.currency_expe,
    exp.t_expense_share_exsh?.length || 0,
    exp.t_expense_payer_expa?.length || 0,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${tripTitle}_expenses_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export expenses to PDF format
 */
export function exportExpensesToPDF(expenses: Expense[], tripTitle: string = 'Trip', budgetAmount?: number) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text(`${tripTitle} - Expense Report`, 14, 20);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
  
  // Summary
  const total = expenses.reduce((sum, exp) => sum + exp.amount_expe, 0);
  doc.setFontSize(12);
  doc.text(`Total Expenses: $${total.toFixed(2)}`, 14, 38);
  
  if (budgetAmount && budgetAmount > 0) {
    const remaining = budgetAmount - total;
    doc.text(`Budget: $${budgetAmount.toFixed(2)}`, 14, 45);
    doc.text(`Remaining: $${remaining.toFixed(2)}`, 14, 52);
  }
  
  // Expenses table
  const tableData = expenses.map(exp => [
    new Date(exp.createdat_expe).toLocaleDateString(),
    exp.title_expe,
    `${exp.currency_expe} ${exp.amount_expe.toFixed(2)}`,
    exp.t_expense_share_exsh?.length || 0,
    exp.t_expense_payer_expa?.length || 0,
  ]);
  
  autoTable(doc, {
    startY: budgetAmount ? 60 : 48,
    head: [['Date', 'Title', 'Amount', 'Shared By', 'Payers']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [51, 51, 51] },
  });
  
  // Category breakdown
  const categories = categorizeExpenses(expenses);
  const categoryData = Object.entries(categories).map(([cat, amount]) => [
    cat,
    `$${amount.toFixed(2)}`,
    `${((amount / total) * 100).toFixed(1)}%`
  ]);
  
  if (categoryData.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 60;
    doc.text('Category Breakdown', 14, finalY + 10);
    
    autoTable(doc, {
      startY: finalY + 15,
      head: [['Category', 'Amount', 'Percentage']],
      body: categoryData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [51, 51, 51] },
    });
  }
  
  doc.save(`${tripTitle}_expenses_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Categorize expenses based on title keywords
 */
function categorizeExpenses(expenses: Expense[]): Record<string, number> {
  return expenses.reduce((acc, exp) => {
    const title = exp.title_expe.toLowerCase();
    let category = 'Other';
    
    if (title.includes('hotel') || title.includes('airbnb') || title.includes('accommodation') || title.includes('lodging')) {
      category = 'Accommodation';
    } else if (title.includes('food') || title.includes('dinner') || title.includes('lunch') || title.includes('breakfast') || title.includes('restaurant') || title.includes('meal')) {
      category = 'Food & Dining';
    } else if (title.includes('transport') || title.includes('taxi') || title.includes('uber') || title.includes('flight') || title.includes('train') || title.includes('bus') || title.includes('car')) {
      category = 'Transportation';
    } else if (title.includes('tour') || title.includes('ticket') || title.includes('museum') || title.includes('activity') || title.includes('attraction')) {
      category = 'Activities';
    } else if (title.includes('shop') || title.includes('souvenir') || title.includes('gift')) {
      category = 'Shopping';
    }
    
    if (!acc[category]) acc[category] = 0;
    acc[category] += exp.amount_expe;
    return acc;
  }, {} as Record<string, number>);
}
