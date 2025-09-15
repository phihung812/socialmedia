export declare class CreateLocationDto {
    country?: string;
    city?: string;
}
export declare class CreateUserDto {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    bio?: string;
    avatar?: string;
    isPrivate?: boolean;
    phoneNumber?: string;
    gender?: string;
    website?: string;
    location?: CreateLocationDto;
}

