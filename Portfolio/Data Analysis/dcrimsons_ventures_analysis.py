import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from openpyxl import load_workbook
from openpyxl.chart import LineChart, Reference

base_dir = Path(__file__).resolve().parents[1]
excel_path = base_dir / 'Data Analysis' / "D'Crimsons_Ventures.xlsx"
output_dir = base_dir / 'assets'
output_dir.mkdir(exist_ok=True)

print("🚀 Phase 1: Loading the D'Crimsons Ventures workbook...")
wb = load_workbook(excel_path, data_only=True)
ws = wb['Consolidated']
rows = list(ws.iter_rows(values_only=True))
header = rows[1]
df = pd.DataFrame(rows[2:], columns=header)
df = df.dropna(subset=['Product ID']).copy()

df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
df['Total Selling Price'] = pd.to_numeric(df['Total Selling Price'], errors='coerce')
df['Profit'] = pd.to_numeric(df['Profit'], errors='coerce')
df['Quantity'] = pd.to_numeric(df['Quantity'], errors='coerce')
df['Month'] = df['Month'].fillna(df['Date'].dt.strftime('%B'))

print("\n📊 Phase 2: Measuring business performance...")
total_sales = df['Total Selling Price'].sum()
total_profit = df['Profit'].sum()
overall_margin = (total_profit / total_sales) * 100
best_product = df.groupby('Product')['Profit'].sum().sort_values(ascending=False).head(1)

print(f"Total Sales: ${total_sales:,.2f}")
print(f"Total Profit: ${total_profit:,.2f}")
print(f"Overall Profit Margin: {overall_margin:.2f}%")
print(f"Top Profit Product: {best_product.index[0]} (${best_product.iloc[0]:,.2f})")

product_profit = df.groupby('Product')[['Total Selling Price', 'Profit']].sum().reset_index()
print("\n📉 Phase 3: Generating visualization files...")
sns.set_theme(style='darkgrid')

plt.figure(figsize=(12, 5))
monthly_sales = df.groupby(df['Date'].dt.to_period('M').dt.to_timestamp())['Total Selling Price'].sum().reset_index()
monthly_sales.columns = ['Month', 'Sales']
plt.plot(monthly_sales['Month'], monthly_sales['Sales'], marker='o', color='#2ecc71', linewidth=2.5)
plt.title("Monthly Sales Trend - D'Crimsons Ventures", fontsize=14, weight='bold')
plt.xlabel('Month')
plt.ylabel('Sales ($)')
plt.tight_layout()
plt.savefig(output_dir / 'dcrimsons_ventures_sales_trend.png', dpi=300)
plt.close()

plt.figure(figsize=(8, 5))
sns.barplot(data=product_profit, x='Product', y='Profit', palette='viridis', hue='Product', dodge=False, legend=False)
plt.title("Profit by Product", fontsize=14, weight='bold')
plt.ylabel('Total Profit ($)')
plt.tight_layout()
plt.savefig(output_dir / 'dcrimsons_ventures_product_profit.png', dpi=300)
plt.close()

print("\n💡 Phase 4: Business recommendation summary")
print("==================================================")
print("Problem: revenue looked healthy, but not every product was creating equal value.")
print("Insight: some product lines were driving volume while creating weaker margins, while a few lines were delivering much stronger returns.")
print("Action: protect margin by tightening discount pressure on lower-performing products and focus more marketing and stock attention on the strongest profit lines.")
print("Recommendation 1: reduce discounting on weaker-margin product lines to protect contribution.")
print("Recommendation 2: reallocate more effort and inventory toward the most profitable products.")
print("Expected outcome: higher profit quality, stronger margin performance, and more sustainable growth over time.")
print("==================================================")
print("✅ Success! Charts are ready for the portfolio and the Excel workbook.")

print("\n📘 Phase 5: Adding a chart sheet to the workbook...")
wb_update = load_workbook(excel_path)
if 'Executive Chart' in wb_update.sheetnames:
    del wb_update['Executive Chart']
summary_ws = wb_update.create_sheet('Executive Summary')
summary_ws.append(['Month', 'Sales'])
for month, sales in monthly_sales.itertuples(index=False, name=None):
    summary_ws.append([month.strftime('%Y-%m'), float(sales)])

chart = LineChart()
chart.title = "Monthly Sales Trend"
chart.y_axis.title = "Sales ($)"
chart.x_axis.title = "Month"
chart.height = 7
chart.width = 16
chart_data = Reference(summary_ws, min_col=2, min_row=1, max_row=summary_ws.max_row)
chart_categories = Reference(summary_ws, min_col=1, min_row=2, max_row=summary_ws.max_row)
chart.add_data(chart_data, titles_from_data=True)
chart.set_categories(chart_categories)
chart_sheet = wb_update.create_chartsheet(title='Executive Chart')
chart_sheet.add_chart(chart)
wb_update.save(excel_path)
print(f"✅ Excel workbook updated with a chart sheet: {excel_path}")
