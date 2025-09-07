const notFound = () => {
  return (
    <div className="flex w-full min-h-96 items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-bold">404</h1>
        <p>The page you're looking for does not exist.</p>
      </div>
    </div>
  );
};

export default notFound;
