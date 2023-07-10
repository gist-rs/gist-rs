export const merge_process_env_to_import_env = () => {
  import.meta.env = import.meta.env || {}
  console.log(JSON.stringify(import.meta.env, null, 2))

  Object.keys(process.env).forEach((key) => {
    const newKey = key.startsWith("WMR_") ? key.replace("WMR_", "") : key;
    import.meta.env[newKey] = process.env[key];
  });

  console.log(JSON.stringify(import.meta.env, null, 2))
}