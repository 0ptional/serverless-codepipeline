import { Tag } from "./Common";

export type EventRule = {
    Type: 'AWS::Events::Rule';
    Properties: {
        EventPattern: {
            source: string[];
            'detail-type': string[];
            resources: string[] | any;
            detail: any;
        },
        Targets: any;
        
    };
}

type IAMPolicy = {
    PolicyName: string;
    PolicyDocument: {
        Statement: PolicyStatement[];
    }
}

type PolicyStatement = {
    Action: string | string[];
    Effect: 'Allow' | 'Deny';
    Principal?: {
        Service: string[];
    };
    Resource?: string | any;
};
