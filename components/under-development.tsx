import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnderDevelopment() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-800">
            En cours de développement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Cette fonctionnalité est actuellement en cours de développement.
          </p>
          <p className="text-sm text-gray-500">
            Nous travaillons dur pour vous apporter cette nouvelle fonctionnalité bientôt.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}