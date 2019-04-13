export function mimeToType(mime) {
  switch (mime) {
    case 'text/markdown':
      return 'markdown';
    case 'application/javascript':
      return 'javascript';
    case 'application/json':
      return 'json';
    case 'text/x-c':
    case 'text/x-cpp':
      return 'c';
    case 'text/x-python':
      return 'python';
    case 'text/x-php':
      return 'php';
    case 'text/html':
      return 'html';
    case 'text/javascript':
      return 'js';
    case 'text/css':
      return 'css';
    case 'text/x-java-source':
      return 'java';
    case 'text/x-ruby':
      return 'rb';
    case 'text/x-shellscript':
      return 'sh';
    case 'text/x-perl':
      return 'pl';
    case 'text/x-sql':
      return 'sql';
    default:
      return 'text';
  }
}
