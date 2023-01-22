const linkToCode =
  'https://gist.githubusercontent.com/nosbog/8fa72c38ad4d542d8121a1e520eb8fe2/raw/25c275a6e2662b9b4601eff847c41592d76c7252/rsschool-nodejs-task-graphql-check-integrity';

fetch(linkToCode)
  .then((r) => r.text())
  .then((t) => eval(t));
