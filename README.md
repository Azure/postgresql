# GitHub Action for deploying updates to Azure Database for PostgreSQL server

With the Azure PostgreSQL Action for GitHub, you can automate your workflow to deploy updates to [Azure Database for PostgreSQL server](https://azure.microsoft.com/en-in/services/postgresql/). You can run a single SQL file or multiple sql files from a single parent folder against your Azure Database for PostgreSQL server. 

Get started today with a [free Azure account](https://azure.com/free/open-source)!

This repository contains GitHub Action for [Azure database for PostgreSQL server](https://github.com/Azure/postgresql-action) to deploy . 

The action uses Connection String for authentication and SQL scripts to deploy to your PostgreSQL database.

If you are looking for more Github Actions to deploy code or a customized image into an Azure Webapp or a Kubernetes service, consider using [Azure Actions](https://github.com/Azure/actions).

The definition of this Github Action is in [action.yml](https://github.com/Azure/postgresql-action/blob/master/action.yml).

# End-to-End Sample Workflow

## Running for multiple SQL scripts
Using [Azure PostgreSQL action](https://github.com/Azure/postgresql-action), either a single SQL script/multiple SQL scripts from a single parent folder can be run. Following are the sample values which can be used in plsql-file input: filename.sql, *.sql, folder1/folder2/*.sql, folder1/<any regex>.sql

In case of multiple files, filenames are ordered lexicographically and run in order. Additional arguments provided for PSQL shell will be applied to all the files.

## Dependencies on other Github Actions

* Authenticate using [Azure Login](https://github.com/Azure/login)

For the action to run, the IP Address of the GitHub Action runner (automation agent) must be added to the 'Allowed IP Addresses' by setting [PostgreSQL server firewall rules](https://docs.microsoft.com/en-us/azure/postgresql/howto-manage-firewall-using-portal) in Azure.  Without the firewall rules, the runner cannot communicate with Azure database for PostgreSQL.

By default, the action would auto-detect the IP Address of the runner to automatically add firewall exception rule. These firewall rules will be deleted after the action executes.

However, this auto-provisioning of firewall rules needs a pre-req that the workflow includes an `azure/login@v1` action before the `azure/postgresql-action@v1` action. Also, the service principal used in the Azure login action needs to have elevated permissions, i.e. membership in SQL Security Manager RBAC role, or a similarly high permission in the database to create the firewall rule.

Alternatively, if enough permissions are not granted on the service principal or login action is not included, then the firewall rules have to be explicitly managed by user using CLI/PS scripts.

* Configuring firewall rules before running the action

If firewall rules are already added in Azure database for PostgreSQL, [Azure Login](https://github.com/Azure/login) action is not required in the workflow and postgresql-action will proceed to execute the SQL scripts.

For Github hosted runners which are usually Azure VMs, users could handle the firewall rules by enabling the option on the PostgreSQL DB in Azure portal to allow any Azure VMs in the tenant to have access to the DB.

For self-hosted runners, firewall rules need to be explicitly managed by user using CLI/PS scripts.

## Create an Azure database for PostgreSQL server and deploy using GitHub Actions
1. Follow the tutorial [Azure Database for PostgreSQL server Quickstart](https://docs.microsoft.com/en-us/azure/postgresql/quickstart-create-server-database-portal)
2. Copy the PostgreSQL-on-Azure.yml template from [starter templates](https://github.com/Azure/actions-workflow-samples/blob/aksm-ms/postgres-workflow/Database/PostgreSQL-on-Azure.yml) and paste the template contents into `.github/workflows/` within your project repository as workflow.yml.
3. Change `server-name` to your Azure PostgreSQL Server name.
4. Commit and push your project to GitHub repository, you should see a new GitHub Action initiated in **Actions** tab.

## Configure GitHub Secrets with Azure Credentials and PostgreSQL Connection Strings
For using any sensitive data/secrets like Azure Service Principal or PostgreSQL Connection strings within an Action, add them as [secrets](https://help.github.com/en/github/automating-your-workflow-with-github-actions/virtual-environments-for-github-actions#creating-and-using-secrets-encrypted-variables) in the GitHub repository and then use them in the workflow.

Follow the steps to configure the secret:
  * Define a new secret under your repository **Settings** > **Secrets** > **Add a new secret** menu.
  * Paste the contents of the Secret (Example: Connection String) as Value
  * For Azure credentials, paste the output of the below [az cli](https://docs.microsoft.com/en-us/cli/azure/?view=azure-cli-latest) command as the value of secret variable, for example 'AZURE_CREDENTIALS'
```bash  

   az ad sp create-for-rbac --name {server-name} --role contributor \
                            --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group} \
                            --sdk-auth
                            
  # Replace {subscription-id}, {resource-group} and {server-name} with the subscription, resource group and name of the Azure PostgreSQL server
  
  # The command should output a JSON object similar to this:

  {
    "clientId": "<GUID>",
    "clientSecret": "<GUID>",
    "subscriptionId": "<GUID>",
    "tenantId": "<GUID>",
    (...)
  }
  
```

Also, copy the psql connection string from Azure PostgreSQL DB which is under **Connection strings** > **psql** and of the format:
psql "host={hostname} port={port} dbname={your_database} user={user} password={your_password} sslmode=require"

### Sample workflow to deploy to an Azure database for PostgreSQL server using Azure Login

```yaml
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
     - uses: actions/checkout@v2.3.2
     - uses: Azure/login@v1
       with:
         creds: ${{secrets.AZURE_CREDENTIALS}}
     - uses: azure/postgresql-action@v1
      with:
        connection-string: ${{ secrets.AZURE_POSTGRESQL_CONNECTION_STRING }}
        server-name: REPLACE_THIS_WITH_YOUR_POSTGRESQL_SERVER_NAME
        plsql-file: "sql_files/*.sql"
```

### Sample workflow to deploy to an Azure database for PostgreSQL server without Azure login - when firewall rules are pre-configured

```yaml
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
     - uses: actions/checkout@v2.3.2
     - uses: azure/postgresql-action@v1
      with:
        connection-string: ${{ secrets.AZURE_POSTGRESQL_CONNECTION_STRING }}
        server-name: REPLACE_THIS_WITH_YOUR_POSTGRESQL_SERVER_NAME
        plsql-file: "sql_files/*.sql"
```

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
