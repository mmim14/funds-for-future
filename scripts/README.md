# Cleaning the scholarship dataset

Run these commands in PowerShell from the project folder:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe scripts/clean_scholarships.py
```

Using the environment's Python directly avoids needing to activate it.
The source CSV remains unchanged. Outputs go to `data/processed`:

- `scholarships_cleaned.csv`: normalized fields and original descriptions.
- `duplicate_rows.csv`: exact duplicate records removed from the output.
- `cleaning_report.json`: missing values, deadline flags, and funding counts.

## Follow the code

1. `clean()` reads all values as text, validates columns, trims whitespace, and removes exact duplicates.
2. `normalize_degrees()` standardizes labels and separates multiple degrees with semicolons.
3. `parse_deadline()` converts supported dates to `YYYY-MM-DD`; other dates stay blank with a review flag.
4. `parse_funding()` extracts simple fixed amounts and upper limits.
5. The end of `clean()` exports the CSV files and report.

Same-title records with different fields remain separate. Missing amounts stay
blank rather than becoming zero. A bare `$` is labeled `unspecified_dollar`;
currency is not inferred from location. Ranges, percentages, and complex funding
descriptions remain text for review. Never sum awards across different currencies.

Deadlines are compared with the local date by default. To reproduce a run:

```powershell
.\.venv\Scripts\python.exe scripts/clean_scholarships.py --as-of 2026-10-10
```

All entries remain unverified, even those with future dates. Location labels
are not treated as residency requirements. Application links and detailed
eligibility requirements are absent from this dataset.
