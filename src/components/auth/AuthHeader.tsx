
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const AuthHeader = () => {
  return (
    <CardHeader className="text-center pb-6 px-6">
      <div className="mx-auto mb-3">
        <img 
          src="/lovable-uploads/574646d6-6de7-444f-a9a2-327c1a816521.png" 
          alt="Recovery Point West Virginia" 
          className="h-16 w-auto mx-auto"
        />
      </div>
      <CardTitle className="text-lg text-slate-700">Content Management System</CardTitle>
      <CardDescription className="text-sm text-slate-500">
        Access your policy and form management dashboard
      </CardDescription>
    </CardHeader>
  );
};
