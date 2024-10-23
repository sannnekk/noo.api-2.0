# Media module

Is an abstraction over the user uploaded files. Currently, only jpg, png and pdf files are supported

### Note

- The file upload is moved to another service and this functionality is deprecated and will be removed in a future release

### Known problems

- When a file has no reference it is still present in the filesystem and is not deleted
