"""Generate a transactional SQL import for the curated CSV (no credentials needed)."""

import csv
from datetime import date
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COLUMNS = [
    "name", "provider", "url", "amount_min", "amount_max", "deadline",
    "degree_levels", "eligible_majors", "min_gpa", "eligibility_text",
    "application_requirements", "residency_states", "citizenship_requirements",
    "eligible_schools", "enrollment_status", "financial_need_required",
]


def sql_value(column, raw):
    value = raw.strip()
    if not value:
        if column in {"name", "provider", "url"}:
            raise ValueError(f"Required field is blank: {column}")
        return "NULL"
    if column in {"amount_min", "amount_max", "min_gpa"}:
        number = Decimal(value)
        if not number.is_finite() or number < 0:
            raise ValueError(f"Invalid number in {column}")
        return str(number)
    if column == "deadline":
        return "DATE '" + date.fromisoformat(value).isoformat() + "'"
    if column == "financial_need_required":
        if value.lower() in {"true", "yes", "t", "y", "1", "on"}:
            return "TRUE"
        if value.lower() in {"false", "no", "f", "n", "0", "off"}:
            return "FALSE"
        raise ValueError("Invalid boolean in financial_need_required")
    if "\x00" in value:
        raise ValueError(f"Null byte in {column}")
    return "'" + value.replace("'", "''") + "'"


def main():
    source = ROOT / "data/scholarship_data.csv"
    with source.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, strict=True)
        if reader.fieldnames != COLUMNS:
            raise ValueError("CSV headers do not match the expected schema")
        values = []
        for index, row in enumerate(reader, start=1):
            if None in row or any(value is None for value in row.values()):
                raise ValueError(f"Record {index} has an incorrect field count")
            if row["amount_min"].strip() and row["amount_max"].strip():
                if Decimal(row["amount_min"]) > Decimal(row["amount_max"]):
                    raise ValueError(f"Record {index} has a reversed amount range")
            values.append("(" + ", ".join(sql_value(column, row[column]) for column in COLUMNS) + ")")
    if not values:
        raise ValueError("CSV is empty")
    sql = (
        "-- Generated from data/scholarship_data.csv. Run the entire file.\n"
        "-- Existing matching records are skipped, not overwritten.\n"
        "BEGIN;\nSET LOCAL standard_conforming_strings = on;\n\n"
        "INSERT INTO public.scholarships (\n    " + ", ".join(COLUMNS) + "\n)\nVALUES\n"
        + ",\n".join(values)
        + "\nON CONFLICT (provider, name, url) DO NOTHING\nRETURNING id, name;\n\n"
        "COMMIT;\n\nSELECT COUNT(*) AS scholarship_count FROM public.scholarships;\n"
    )
    destination = ROOT / "database/import_scholarships.sql"
    destination.write_text(sql, encoding="utf-8")
    print(f"Generated {len(values)} records in {destination}")


if __name__ == "__main__":
    main()
