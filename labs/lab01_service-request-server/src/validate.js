const CATEGORIES = [
  'IT Support',
  'Maintenance',
  'Library',
  'Transport',
  'Classroom/Equipment',
  'Lost & Found',
  'Facility',
];
const PRIORITIES = ['Low', 'Medium', 'High'];
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidDate(value) {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export function validateRequestInput(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const errors = [];
  const name = typeof input.name === 'string' ? input.name.trim() : input.name;
  const description =
    typeof input.description === 'string' ? input.description.trim() : input.description;

  if (typeof name !== 'string') {
    errors.push('name is required and must be a string');
  } else if (name.length < 1 || name.length > 100) {
    errors.push('name must be between 1 and 100 characters');
  }

  if (typeof input.category !== 'string') {
    errors.push('category is required');
  } else if (!CATEGORIES.includes(input.category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  }

  if (typeof description !== 'string') {
    errors.push('description is required and must be a string');
  } else if (description.length < 1 || description.length > 1000) {
    errors.push('description must be between 1 and 1000 characters');
  }

  if (!PRIORITIES.includes(input.priority)) {
    errors.push(`priority must be one of: ${PRIORITIES.join(', ')}`);
  }

  const date = input.date === undefined ? today() : input.date;
  if (typeof date !== 'string' || !isValidDate(date)) {
    errors.push('date must be a valid calendar date in YYYY-MM-DD format');
  }

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    value: {
      name,
      category: input.category,
      description,
      priority: input.priority,
      date,
      status: 'Open',
    },
  };
}
