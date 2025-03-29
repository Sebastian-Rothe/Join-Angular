export class User {
    uid?: string = '';
    name: string = '';
    email: string = '';
    profilePicture: string = '';
    initials: string = '';
    iconColor: string = '';

    constructor(obj?: Partial<User>) {
        if (obj) {
            Object.assign(this, obj);
        }
        // Generate derived values
        this.initials = this.generateInitials(this.name);
        this.iconColor = this.generateRandomColor();
    }

    toPlainObject(): Record<string, any> {
        return {
            uid: this.uid,
            name: this.name,
            email: this.email,
            profilePicture: this.profilePicture,
            initials: this.initials,
            iconColor: this.iconColor
        };
    }

    private generateInitials(name: string): string {
        if (!name) return '';
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase();
    }

    private generateRandomColor(): string {
        const colors = [
            '#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF', 
            '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', 
            '#FC71FF', '#FFC701'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}
