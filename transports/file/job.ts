import { JobsOptions, Queue, Worker } from "bullmq";

const file = new Queue('fileLog')
async function addJobToFileLog({ name, data, options }: { name: string; data: any; options?: JobsOptions | undefined; }) {
  // if (!name || typeof name !== String as unknown as string) {
  //   return `Name parameter missing or not a String`
  // }
  // if (!data) {
  //   return `Data cannot be empty`
  // }

  await file.add(name, data, options)
}
const fileWorker = new Worker('fileLog', async job => {
  const { data, name } = job
  console.log('job', name)
})

fileWorker

// fileWorker.on('completed', job => {
//   console.log('Job', job)
// })

export { addJobToFileLog }
