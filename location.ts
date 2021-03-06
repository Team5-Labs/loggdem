import Stacktrace from 'stack-trace'
const getLocation = (stepInStack: number = 2) => {
  try {
    throw new Error('Log stack');
  } catch (e) {
    // try {
    //   const err: Error = e;
    //   const stackLocations = err.stack
    //     .split('\n')
    //     .map((m) => m.trim())
    //     .filter((m) => m.startsWith('at'));

    //   return String(stackLocations[stepInStack]).slice(23).replace(')', '');
    // } catch (e) {
    //   return '';
    // }
    let trace = Stacktrace.parse(e)
    let currTrace = trace.find(x => x.functionName == null && x.methodName == null && x.typeName == 'Object')
    try {
      return `${currTrace.fileName}:${currTrace.lineNumber}:${currTrace.columnNumber}`
    } catch (error) {
      let t = trace[trace.length - 2]
      return `${t.fileName}:${t.lineNumber}:${t.columnNumber}`
    }
  }
};

export { getLocation };
