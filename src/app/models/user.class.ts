export class UserClass {
    private static readonly COLORS: string[] = [
        '#FF7A00', // Orange
        '#FF5EB3', // Pink
        '#6E52FF', // Purple
        '#9327FF', // Violet
        '#00BEE8', // Blue
        '#1FD7C1', // Turquoise
        '#FF745E', // Coral
        '#FFA35E', // Light Orange
        '#FC71FF', // Magenta
        '#FFC701', // Yellow
    ];

    name: string = 'Guest User';
    email: string = 'guest@temporary.com';
    profilePicture: string;
    initials: string;
    iconColor: string;

    constructor(obj?: any) {
        this.name = obj ? obj.name : '';
        this.email = obj ? obj.email : '';
        this.profilePicture = obj ? obj.profilePicture : '';
        this.iconColor = obj ? obj.iconColor : this.generateRandomColor();
        this.initials = this.generateInitials(this.name);
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
        const randomIndex = Math.floor(Math.random() * UserClass.COLORS.length);
        return UserClass.COLORS[randomIndex];
    }
}
