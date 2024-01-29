export interface Resource {
    title: string;
    url: URL;
    resourceType: ResourceType;
}

export interface ResourceType {
    title: string;
    slug: string;
    description: string;
    icon: string;
}
