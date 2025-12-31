import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
            <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-8">You do not have permission to view this page.</p>
            <Link to="/" className="text-primary hover:underline font-bold">Go Home</Link>
        </div>
    );
};

export default Unauthorized;
