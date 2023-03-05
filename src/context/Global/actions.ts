export enum ActionType {
    SET_GLOBAL_ENABLED = 'set_global_enabled',
    SET_SELECTED_PROFILE = 'set_selected_profile',
    SET_PROFILES = 'set_profiles',
    UPDATE_CURRENTLY_SELECTED_PROFILE_FIELDS = 'update_currently_selected_profile_fields',
    SET_CURRENT_PROFILE_REQUEST_HEADERS = 'set_current_profile_request_headers',
    SET_CURRENT_PROFILE_NEW_HEADER = 'set_current_profile_NEW_HEADER',
    SET_CURRENT_PROFILE_DELETE_HEADER = 'set_current_profile_delete_header',
    CREATE_NEW_PROFILE = 'create_new_profile',
    UPDATE_PROFILE_ENABLE = 'update_profile_enable',
    DUPLICATE_CURRENT_PROFILE = 'duplicate_current_profile',
    DELETE_CURRENT_PROFILE = 'delete_current_profile',
    APPEND_TO_PROFILES = 'APPEND_TO_PROFILES'
}

export type Action = {
    type: ActionType;
    payload?: any;
};
