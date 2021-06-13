type sendMessage = (stimlus: string, context?: string[], language?: string) => Promise<String>;
declare function cleverbot(): Promise<sendMessage>;
export default cleverbot;
