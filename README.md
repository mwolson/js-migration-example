
# Migrations

Automated scripts to perform JS source code migrations.

## Commands

Run any missing migration steps:

```sh
grunt up
```

Undo the effect of any migrations that are not checked in:

```sh
grunt reset
```

Add a new migration task with `hello-world` and a timestamp in the name:

```sh
grunt create --name hello-world
```
