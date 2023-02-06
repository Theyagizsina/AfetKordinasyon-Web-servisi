export interface CreateAdminInput{
    name: string;
    adminID: string;
    password: string;
    isAdmin: boolean;
}

export interface EditAdminInputs{
    name: string;
}

export interface AdminLoginInputs {
    adminID: string;
    password: string;
}

export interface AdminPayload {
    _id: string;
    adminID: string;
    name: string;
    isAdmin: boolean;
}