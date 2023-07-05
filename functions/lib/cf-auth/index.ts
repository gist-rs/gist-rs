// forked from https://github.com/subhendukundu/worker-auth-providers
// due to unsupport node 12 while build on pages builder version 1
// and failed to build pages builder version 2 yarn@3.5.1, nodejs@18.16.0 due to 
// `wmr` dep fsevents@npm:2.3.2: Implicit dependencies on node-gyp are discouraged.
// current workaround: use pages builder version 1
import * as google from './providers/google';
export {
  google,
};