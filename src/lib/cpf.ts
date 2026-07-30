// CPF — stored digits-only, validated by its own check digits.
//
// We do NOT consult the Receita: this confirms the number is well formed, not
// that the person exists. That is worth doing anyway, because the two most
// common failures are a typo and a made-up number, and both are caught here.

/** Strip everything that isn't a digit. */
export function apenasDigitos(v: string): string {
  return v.replace(/\D/g, "");
}

/** "12345678901" -> "123.456.789-01", as far as the digits go. */
export function formatarCPF(v: string): string {
  const d = apenasDigitos(v).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function digitoVerificador(digitos: string, peso: number): number {
  let soma = 0;
  for (let i = 0; i < digitos.length; i++) {
    soma += Number(digitos[i]) * (peso - i);
  }
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

/**
 * True when the 11 digits check out. Rejects the repeated-digit numbers
 * (11111111111 and friends) — they satisfy the arithmetic but are not real
 * CPFs, and they are exactly what someone types to get past a required field.
 */
export function cpfValido(v: string): boolean {
  const d = apenasDigitos(v);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  return (
    digitoVerificador(d.slice(0, 9), 10) === Number(d[9]) &&
    digitoVerificador(d.slice(0, 10), 11) === Number(d[10])
  );
}

/** Brazilian mobile numbers are 10 or 11 digits including the area code. */
export function telefoneValido(v: string): boolean {
  const d = apenasDigitos(v);
  return d.length === 10 || d.length === 11;
}

/** "51999998888" -> "(51) 99999-8888" */
export function formatarTelefone(v: string): string {
  const d = apenasDigitos(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
