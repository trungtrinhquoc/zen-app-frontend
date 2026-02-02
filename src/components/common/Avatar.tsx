import { cn } from '../../utils/cn';

interface AvatarProps {
    src?: string;
    className?: string;
    fallback?: string;
}

const Avatar = ({ src, className, fallback }: AvatarProps) => {
    return (
        <div className={cn('h-10 w-10 overflow-hidden rounded-full glass flex items-center justify-center', className)}>
            {src ? (
                <img src={src} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
                <span className="text-xs font-bold">{fallback || 'U'}</span>
            )}
        </div>
    );
};

export default Avatar;
