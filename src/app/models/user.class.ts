/**
 * Class representing a user in the application.
 * 
 * @description
 * This class manages user-related data and provides functionality for
 * user profile management, including automatic generation of initials
 * and profile colors.
 * 
 * @class User
 * @property {string} [uid] - Unique identifier for the user
 * @property {string} name - Full name of the user
 * @property {string} email - Email address of the user
 * @property {string} phone - Phone number of the user
 * @property {string} profilePicture - URL or base64 string of user's profile picture
 * @property {string} initials - Automatically generated initials from user's name
 * @property {string} iconColor - Randomly assigned color for user's avatar
 * @property {boolean} isGuest - Flag indicating if the user is a guest
 */
export class User {
    uid?: string = '';
    name: string = '';
    email: string = '';
    phone: string = '';
    profilePicture: string = '';
    initials: string = '';
    iconColor: string = '';
    isGuest: boolean = false;

    /**
     * Creates an instance of User.
     * 
     * @param {Partial<User>} [obj] - Optional object containing user properties
     */
    constructor(obj?: Partial<User>) {
        if (obj) {
            Object.assign(this, obj);
        }
        // Generate initials if name exists
        if (this.name) {
            this.initials = this.generateInitials(this.name);
        }
        // Only generate color if not already set
        if (!this.iconColor) {
            this.iconColor = this.generateRandomColor();
        }
    }

    /**
     * Converts the User instance to a plain JavaScript object.
     * 
     * @returns {Record<string, any>} Plain object representation of the user
     */
    toPlainObject(): Record<string, any> {
        return {
            uid: this.uid,
            name: this.name,
            email: this.email,
            phone: this.phone,
            profilePicture: this.profilePicture,
            initials: this.initials,
            iconColor: this.iconColor
        };
    }

    /**
     * Generates initials from a user's full name.
     * Takes up to three parts of the name and uses their first letters.
     * 
     * @private
     * @param {string} name - The full name to generate initials from
     * @returns {string} Generated initials in uppercase
     */
    private generateInitials(name: string): string {
        if (!name) return '';
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .slice(0, 3) 
            .join('')
            .toUpperCase();
    }

    /**
     * Generates a random color from a predefined set of colors.
     * Used for user avatar backgrounds when no profile picture is available.
     * 
     * @private
     * @returns {string} Hexadecimal color code
     */
    private generateRandomColor(): string {
        const colors = [
            '#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF', 
            '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', 
            '#FC71FF', '#FFC701'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}
