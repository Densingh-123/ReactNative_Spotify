export const getFestiveGreeting = (name: string): string | null => {
  const d = new Date();
  const m = d.getMonth();
  const date = d.getDate();
  const year = d.getFullYear();
  
  if (m === 0 && date === 1) return `Happy New Year ${year}, ${name}!`;
  // Diwali roughly Oct/Nov (using a wide range since it changes)
  if ((m === 9 || m === 10) && date >= 1 && date <= 15) return `Happy Diwali, ${name}!`;
  // Christmas
  if (m === 11 && date === 25) return `Merry Christmas, ${name}!`;
  
  return null;
};
