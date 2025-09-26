export default function VacancyCreationFlow(workflowCtx, portal) {
  return {
    Overview: {
      name: "Overview",
      stepCallback: async () => {
        return workflowCtx.showContent(
          `# Vacancy Creation Flow

The Vacancy Creation Flow walks you through the process of interacting with the **Vacancies API**.  
This workflow demonstrates how to list existing vacancies, create a new vacancy, update it, and then retrieve the details of the created vacancy.


## Steps in the Flow
1. **Get All Vacancies** – Retrieve a collection of existing vacancies.  
2. **Create a Vacancy** – Add a new vacancy resource with the required "product_type" and property details.  
3. **Update a Vacancy** – Modify an existing vacancy, such as updating move-in or move-out dates.  
4. **Get Created Vacancy** – Fetch the full details of a newly created or updated vacancy.  

## Key Notes
- The "product_type" must always be set to "inform_only" when creating a new vacancy through this API.  
- Certain attributes, such as "move_in_date" or "move_out_date", are conditionally required.  
- Updating vacancies has rules and limitations, especially around dates and rollback behavior.  
- Deleted vacancies halt provider communication and send revocation messages if applicable.  

---

This flow is designed to give you hands-on experience with the **Vacancies API**, so that you can confidently integrate vacancy management into your applications.

          `
        );
      },
    },
    "Step 1": {
      name: "Get All Vacancies",
      stepCallback: async () => {
        return workflowCtx.showEndpoint({
          description:
            "Returns a collection of Vacancies.\n\nFor details on the attributes of Vacancies, consult the documentation for vacancies.show",
          endpointPermalink: "$e/vacancies/vacancies.index",
          verify: (response, setError) => {
            if (response.StatusCode == 200) {
              return true;
            } else {
              return true;
            }
          },
        });
      },
    },
    "Step 2": {
      name: "Create a Vacancy",
      stepCallback: async () => {
        return workflowCtx.showEndpoint({
          description:
            "Create a new Vacancy resource. `product_type` must be set to `inform_only`.\n\nAttribute              | Type      | Description\n-----------------------| --------- | ------------\n`property_id`**\\***    | string    | A valid `property_id` for a Property in Notify\n`move_out_date`        | string    | The date at which the property became vacant (required when `move_in_date` is omitted).\n`move_in_date`         | string    | The date at which the new tenants are moving in (required when `move_out_date` is omitted).\n`product_type`**\\***   | string    | Must be set to `inform_only`\n`letting_status`       | string    | Optional - can be given as `managed` or `let_only` if known\n`is_new_build`         | boolean   | Optional - can be given as true or false if known\n`number_of_tenants`    | integer   | Optional - can be given as an integer between 1 and 20 inclusive if known",
          endpointPermalink: "$e/vacancies/vacancies.store",
          verify: (response, setError) => {
            if (response.StatusCode == 200) {
              return true;
            } else {
              return true;
            }
          },
        });
      },
    },
    "Step 3": {
      name: "Update a Vacancy",
      stepCallback: async () => {
        return workflowCtx.showEndpoint({
          description:
            "Update a Vacancy resource.\n\nWe require at least one `move_in` type Liable Party to have been created on the Vacancy before the `move_in_date` can be set.\nAttempting to update the Vacancy with a `move_in_date` before this Liable Party has been added will result in an error.\nUpdating a Vacancy with a 'move_in_date' is a required step before 'move_in' type Services can be created. See 'Services' section for more details.\n\nIt is also possible to update the dates on the vacancy if the date that the property is becoming vacant or the date that the tenant is moving in has changed.\n\nIn order to prevent us sending providers outdated information, we have a hard limit of only allowing dates to be updated from up to 2 months in the past.\n\nFor example, if the original `move_in_date` given was `2022-08-01`, the last day in which this could be updated is `2022-10-01`.\n\nBoth dates cannot be edited at the same time on a vacancy. If you wish to edit both the move_out_date and move_in_date, this should be performed as two separate requests\n\nWe also allow for the updating of the `letting_status` of the vacancy whether this is fully mananged, or let only. As well as the `number_of_tenants` and whether the property `is_new_build` or not.\n\nVacancies with a move out and a move in set can be 'rolled back' to a move out only state by patching the `state` to `move_out`. This will result in us sending revocation messages for any move in services for which we have already informed the providers.\n\nFinally, vacancies can be deleted from our system by patching a 'deletion_reason' - this can be performed on any vacancy where the commission related to it has not been withdrawn by the user.\n\nDeleting a vacancy will result in us halting any communication with providers and sending revocation messages to any providers that we have already contacted, informing them that our previous communication should be disregarded.\n\nAttribute              | Type      | Description\n-----------------------| --------- | ------------\n`move_out_date`        | string    | The date (`Y-m-d`) on which the property becomes vacant. Must be before or equal to the `move_in_date`, if it is currently set on the Vacancy.\n`move_in_date`         | string    | The date (`Y-m-d`) when the new tenant(s) will be moving in. Must be after or equal to the `move_out_date` currently set on the Vacancy. Must have at least one `move_in` type Liable Party created.\n`letting_status`       | string    | Optional - can be given as `managed` or `let_only` if known\n`is_new_build`         | boolean   | Optional - can be given as true or false if known\n`number_of_tenants`    | integer   | Optional - can be given as an integer between 1 and 20 inclusive if known\n`state`                | string    | Optional - on a `move_in` vacancy with a move out, this can be set to `move_out` to roll back the vacancy to a move out only state.\n`deletion_reason`      | string    | Optional - must be provided to delete a vacancy and should describe why the vacancy has been deleted. Max 255 characters.",
          endpointPermalink: "$e/vacancies/vacancies.update",
          verify: (response, setError) => {
            if (response.StatusCode == 200) {
              return true;
            } else {
              return true;
            }
          },
        });
      },
    },
    "Step 4": {
      name: "Get Created Vacancy",
      stepCallback: async () => {
        return workflowCtx.showEndpoint({
          description:
            "Fetches a single Vacancy resource.\n\nAttribute               | Type      | Description\n------------------------| --------- | ------------\n`product_type`          | string    | Either `inform_only` or `void_cover`. Only `inform_only` Vacancies can be created via this API.\n`move_out_date`         | string    | The date (`Y-m-d`) at which the property became vacant. The start of the void period.\n`move_in_date`          | string    | The date (`Y-m-d`) at which the new tenancy began.\n`move_out_submitted_at` | string    | The date (`Y-m-d`) at which Notify was informed of the `move_out_date`\n`move_in_submitted_at`  | string    | The date (`Y-m-d`) at which Notify was informed of the `move_in_date`\n`state`                 | string    | The current state of the Vacancy. Can be `move_out` or `move_in`. Defaults to `move_out` when created, and changes to `move_in` when successfully updated with a `move_in_date`\n`commission_state`      | string    | The current commission payable state of the Vacancy. Can be `pending`, `qualified` or `unqualified`.\n`tenancy_confirmation`  | string    | The current tenancy confirmation state of the Vacancy. Can be `pending`, `confirmed` or `fallen_through`.\n`has_pending_find`      | boolean   | Will return `false` if the utility providers have been identified for all Services for this Vacancy.\n`has_pending_inform`    | boolean   | Will return `false` if all utility providers have been informed of all requested Services for this Vacancy.\n`requires_readings`     | boolean   | Will return `false` if all required meter readings for this vacancy have been provided.\n`created_at`            | string    | The datetime (UTC) when the Vacancy was added to Notify\n`updated_at`            | string    | The datetime (UTC) when the Vacancy was last updated\n`deleted_at`            | string    | The datetime (UTC) when the Vacancy was soft deleted\n`expects_move_in`       | boolean   | Will return `false` if the agent has indicated that they do not expect there to be a move in.\n`letting_status`        | string    | Will either be `managed`, `let_only` or `NULL`\n`is_new_build`          | boolean   | Will return `true` if the agent has indicated that the property is a new build\n`number_of_tenants`     | integer   | The number of tenants moving into the property. An integer between 1 and 20 inclusive.",
          endpointPermalink: "$e/vacancies/vacancy.show",
          verify: (response, setError) => {
            if (response.StatusCode == 200) {
              return true;
            } else {
              return true;
            }
          },
        });
      },
    },
  };
}
