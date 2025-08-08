export default function Support() {
  const waLink = `https://wa.me/?text=${encodeURIComponent('Hello EduMind support, I need help with...')}`;
  return (
    <div className="grid gap-6 max-w-2xl">
      <div className="p-4 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">WhatsApp Support</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Chat with us on WhatsApp for quick help.</p>
        <a href={waLink} target="_blank" className="px-3 py-2 bg-green-600 text-white rounded-md">Open WhatsApp</a>
      </div>
      <div className="p-4 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">FAQ</h3>
        <ul className="list-disc pl-6 text-sm text-gray-600 dark:text-gray-300">
          <li>How to use AI Study Modes?</li>
          <li>How to generate flashcards from notes?</li>
          <li>How to manage subscription and billing?</li>
        </ul>
      </div>
    </div>
  );
}