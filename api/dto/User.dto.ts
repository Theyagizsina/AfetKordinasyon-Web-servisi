export interface CreateUserInput{
    name: string;
    email: string;
    phone: string;
    password: string;
    mailPermission: boolean;
    googleUserObject: string;
}

export interface EditUserInputs{
    coverImage: string;
    investments: any;
    follows: any;
    alarms: [any];
}

export interface UserLoginInputs {
    email: string;
    password: string;
}

export interface UserPayload {
    _id: string;
    email: string;
    name: string;
}