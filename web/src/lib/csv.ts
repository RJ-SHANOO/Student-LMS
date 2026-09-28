// Minimal CSV builder — quotes any field containing a comma, quote, or newline,
// doubling embedded quotes per RFC 4180. Good enough for the small attendance
// exports this app produces; no need for a dependency.
export function toCsv(headers: string[], rows: (string | number)[][]) {
  const escape = (value: string | number) => {
    const str = String(value ?? "");
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [headers.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))];
  return lines.join("\r\n");
}
