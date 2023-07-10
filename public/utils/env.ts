export const merge_process_env_to_import_env = () => {
  import.meta.env = import.meta.env || {}
  Object.keys(process.env).forEach((key) => {
    const newKey = key.startsWith("WMR_") ? key.replace("WMR_", "") : key;
    import.meta.env[newKey] = process.env[key];
  });
}