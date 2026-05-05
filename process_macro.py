import pandas as pd
import json
import os

def main():
    file_path = 'Data/Static_data/Sites MACRO.xlsx'

    # Check if file exists
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    # Read the excel file
    # We might need to check the sheet name or just read the first sheet
    xls = pd.ExcelFile(file_path)
    print("Sheets:", xls.sheet_names)
    df = pd.read_excel(file_path, sheet_name=xls.sheet_names[0])

    print("Columns:", df.columns.tolist())

    # We need Site Code, Site Name, Vendor, Town, Region, Typology
    # Print the first few rows to understand the structure
    print(df.head())

    # Convert to JSON
    # Usually it's a list of dictionaries
    # Replace NaN with null
    df = df.where(pd.notnull(df), None)
    records = df.to_dict(orient='records')

    with open('sites_macro.json', 'w') as f:
        json.dump(records, f, indent=2)

if __name__ == "__main__":
    main()
