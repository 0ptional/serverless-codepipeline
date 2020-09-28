export type IAMRole = {
    Type: 'AWS::IAM::Role';
    Properties: {
        AssumeRolePolicyDocument: {
            Statement: PolicyStatement[]
        };
        Policies: IAMPolicy[]
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
    Resource?: string;
};
