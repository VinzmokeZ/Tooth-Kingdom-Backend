/**
 * Password Validation Utility
 * Matches backend validation rules
 */

export interface PasswordValidationResult {
    valid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
}

export class PasswordValidator {
    /**
     * Validate password strength
     * Requirements:
     * - Minimum 8 characters
     * - At least 1 uppercase letter
     * - At least 1 lowercase letter
     * - At least 1 number
     * - At least 1 special character
     */
    static validate(password: string): PasswordValidationResult {
        const errors: string[] = [];
        let strength: 'weak' | 'medium' | 'strong' = 'weak';

        // Check minimum length
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        // Check for uppercase letter
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        // Check for lowercase letter
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        // Check for number
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        // Check for special character
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
        }

        // Calculate strength
        if (errors.length === 0) {
            if (password.length >= 12 && /[A-Z].*[A-Z]/.test(password) && /[0-9].*[0-9]/.test(password)) {
                strength = 'strong';
            } else {
                strength = 'medium';
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            strength,
        };
    }

    /**
     * Get password strength color
     */
    static getStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
        switch (strength) {
            case 'weak':
                return 'text-red-500';
            case 'medium':
                return 'text-yellow-500';
            case 'strong':
                return 'text-green-500';
            default:
                return 'text-gray-500';
        }
    }

    /**
     * Get password strength label
     */
    static getStrengthLabel(strength: 'weak' | 'medium' | 'strong'): string {
        switch (strength) {
            case 'weak':
                return 'Weak';
            case 'medium':
                return 'Medium';
            case 'strong':
                return 'Strong';
            default:
                return '';
        }
    }
}
