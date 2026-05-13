export const joinClasses = (...classes: Array<string | undefined>) => {
    return classes.filter(Boolean).join(" ");
};