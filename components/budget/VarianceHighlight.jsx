export default function VarianceHighlight({ variance }) {
  const formattedVariance = parseFloat(variance).toFixed(2);
  const isNegative = variance < 0;
  const isPositive = variance > 0;

  return (
    <span className={`font-semibold ${
      isNegative ? 'text-green-600' : isPositive ? 'text-red-600' : 'text-gray-600'
    }`}>
      {isPositive && '+'}{formattedVariance < 0 ? '-' : ''}${Math.abs(formattedVariance)}
    </span>
  );
}