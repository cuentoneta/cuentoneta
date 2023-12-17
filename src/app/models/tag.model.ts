export interface Tag {
    title: string;
    slug: string;
    description: string;
    icon?: {
        name: string;
        provider: string;
        svg: string;
    };
}
