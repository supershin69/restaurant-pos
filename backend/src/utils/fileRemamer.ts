export const renameFile = (originalName: string): string => {
    const fileExtension = originalName.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const newFileName = `${timestamp}-${randomString}.${fileExtension}`;
    return newFileName;
}