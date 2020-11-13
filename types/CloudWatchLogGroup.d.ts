export type CloudWatchLogGroup = {
    Type: 'AWS::Logs::LogGroup';
    Properties: {
        LogGroupName: string;
        RetentionInDays?: number;
    };
};
