/**
 * Generates user initials from first and last name.
 *
 * @example
 * getInitials('John', 'Doe') // 'JD'
 * getInitials('Alice', 'Smith') // 'AS'
 */
export const getInitials = (firstName: string, lastName: string): string => {
	return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Generates full name from first and last name.
 *
 * @example
 * getFullName('John', 'Doe') // 'John Doe'
 */
export const getFullName = (firstName: string, lastName: string): string => {
	return `${firstName} ${lastName}`;
};
