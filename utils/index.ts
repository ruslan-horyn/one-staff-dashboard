// Barrel exports for utility functions

// SSR utilities
export { getWindow } from './ssr';
// Try-catch utility with Result type
export {
	type ErrorResult,
	isErr,
	isOk,
	type Result,
	type SuccessResult,
	tryCatch,
	unwrap,
	unwrapOr,
} from './try-catch';
// User display utilities
export { getFullName, getInitials } from './user';
