// Security module for command validation
pub mod security;
// Command execution module
pub mod executor;

use security::{SecurityValidator, ThreatLevel, ValidationResult};
use executor::{CommandExecutor, AutomationResponse, ExecutionResult, ExecutionOutput};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{State, Window};

/// Application state holding the security validator
pub struct AppState {
    pub validator: Mutex<SecurityValidator>,
}

/// Response structure for validation results (serializable for frontend)
#[derive(Debug, Serialize, Deserialize)]
pub struct ValidationResponse {
    pub is_safe: bool,
    pub threat_level: String,
    pub warnings: Vec<String>,
    pub blocked_patterns: Vec<String>,
}

impl From<ValidationResult> for ValidationResponse {
    fn from(result: ValidationResult) -> Self {
        Self {
            is_safe: result.is_safe,
            threat_level: match result.threat_level {
                ThreatLevel::Safe => "safe".to_string(),
                ThreatLevel::Low => "low".to_string(),
                ThreatLevel::Medium => "medium".to_string(),
                ThreatLevel::High => "high".to_string(),
                ThreatLevel::Critical => "critical".to_string(),
            },
            warnings: result.warnings,
            blocked_patterns: result.blocked_patterns,
        }
    }
}

/// Response for command execution
#[derive(Debug, Serialize, Deserialize)]
pub struct ExecutionResponse {
    pub success: bool,
    pub output: Option<String>,
    pub error: Option<String>,
    pub validation: ValidationResponse,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            validator: Mutex::new(SecurityValidator::new()),
        })
        .invoke_handler(tauri::generate_handler![
            exec_xx,
            validate_command,
            validate_script,
            validate_ai_response,
            execute_validated_command,
            execute_powershell,
            execute_automation,
            add_blacklist_pattern,
            remove_blacklist_pattern,
            get_security_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Legacy command - kept for compatibility
#[tauri::command]
fn exec_xx(command: String) -> String {
    format!("Executed command: {}", command)
}

/// Validate a single command
#[tauri::command]
fn validate_command(
    command: String,
    state: State<AppState>,
) -> Result<ValidationResponse, String> {
    let validator = state.validator.lock().map_err(|e| e.to_string())?;
    
    match validator.validate_command(&command) {
        Ok(result) => Ok(result.into()),
        Err(e) => Ok(ValidationResponse {
            is_safe: false,
            threat_level: "critical".to_string(),
            warnings: vec![e.to_string()],
            blocked_patterns: vec![e.to_string()],
        }),
    }
}

/// Validate a multi-line script
#[tauri::command]
fn validate_script(
    script: String,
    state: State<AppState>,
) -> Result<ValidationResponse, String> {
    let validator = state.validator.lock().map_err(|e| e.to_string())?;
    
    match validator.validate_script(&script) {
        Ok(result) => Ok(result.into()),
        Err(e) => Ok(ValidationResponse {
            is_safe: false,
            threat_level: "critical".to_string(),
            warnings: vec![e.to_string()],
            blocked_patterns: vec![e.to_string()],
        }),
    }
}

/// Validate an AI-generated response before execution
#[tauri::command]
fn validate_ai_response(
    response: String,
    state: State<AppState>,
) -> Result<ValidationResponse, String> {
    let validator = state.validator.lock().map_err(|e| e.to_string())?;
    
    match validator.validate_ai_response(&response) {
        Ok(result) => Ok(result.into()),
        Err(e) => Ok(ValidationResponse {
            is_safe: false,
            threat_level: "critical".to_string(),
            warnings: vec![e.to_string()],
            blocked_patterns: vec![e.to_string()],
        }),
    }
}

/// Execute a command after validation
#[tauri::command]
async fn execute_validated_command(
    command: String,
    force_execute: bool,
    state: State<'_, AppState>,
) -> Result<ExecutionResponse, String> {
    // First validate the command
    let validation_result = {
        let validator = state.validator.lock().map_err(|e| e.to_string())?;
        validator.validate_command(&command)
    };
    
    let validation_response = match &validation_result {
        Ok(result) => ValidationResponse {
            is_safe: result.is_safe,
            threat_level: match result.threat_level {
                ThreatLevel::Safe => "safe".to_string(),
                ThreatLevel::Low => "low".to_string(),
                ThreatLevel::Medium => "medium".to_string(),
                ThreatLevel::High => "high".to_string(),
                ThreatLevel::Critical => "critical".to_string(),
            },
            warnings: result.warnings.clone(),
            blocked_patterns: result.blocked_patterns.clone(),
        },
        Err(e) => ValidationResponse {
            is_safe: false,
            threat_level: "critical".to_string(),
            warnings: vec![e.to_string()],
            blocked_patterns: vec![e.to_string()],
        },
    };
    
    // Check if we should execute
    let should_execute = match &validation_result {
        Ok(result) => result.is_safe || (force_execute && result.threat_level <= ThreatLevel::Medium),
        Err(_) => false,
    };
    
    if !should_execute {
        return Ok(ExecutionResponse {
            success: false,
            output: None,
            error: Some("Command blocked by security validator".to_string()),
            validation: validation_response,
        });
    }
    
    // Execute the command
    // TODO: Implement actual command execution based on your needs
    // For now, we return a placeholder response
    Ok(ExecutionResponse {
        success: true,
        output: Some(format!("Command validated and ready for execution: {}", command)),
        error: None,
        validation: validation_response,
    })
}

/// Add a pattern to the blacklist
#[tauri::command]
fn add_blacklist_pattern(
    pattern: String,
    state: State<AppState>,
) -> Result<String, String> {
    let mut validator = state.validator.lock().map_err(|e| e.to_string())?;
    validator.add_blacklist_pattern(&pattern);
    Ok(format!("Pattern '{}' added to blacklist", pattern))
}

/// Remove a pattern from the blacklist
#[tauri::command]
fn remove_blacklist_pattern(
    pattern: String,
    state: State<AppState>,
) -> Result<bool, String> {
    let mut validator = state.validator.lock().map_err(|e| e.to_string())?;
    Ok(validator.remove_blacklist_pattern(&pattern))
}

/// Get current security configuration
#[tauri::command]
fn get_security_config(state: State<AppState>) -> Result<String, String> {
    let validator = state.validator.lock().map_err(|e| e.to_string())?;
    Ok(validator.get_config_summary())
}

// ============================================
// Command Execution Commands
// ============================================

/// Execute PowerShell script with validation
#[tauri::command]
async fn execute_powershell(
    script: String,
    state: State<'_, AppState>,
) -> Result<ExecutionResult, String> {
    // Validate first
    let validation = {
        let validator = state.validator.lock().map_err(|e| e.to_string())?;
        validator.validate_command(&script)
    };
    
    // Check if safe to execute
    match validation {
        Ok(result) if result.is_safe || result.threat_level <= ThreatLevel::Low => {
            let executor = CommandExecutor::new();
            executor.execute(&script).await
        }
        Ok(result) => {
            Err(format!(
                "Command blocked - Threat level: {:?}. Warnings: {}",
                result.threat_level,
                result.warnings.join(", ")
            ))
        }
        Err(e) => Err(format!("Validation failed: {}", e)),
    }
}

/// Execute automation response from AI with streaming output
#[tauri::command]
async fn execute_automation(
    automation: AutomationResponse,
    window: Window,
    state: State<'_, AppState>,
) -> Result<Vec<ExecutionResult>, String> {
    // Validate the automation first
    let script_to_validate = automation.script.clone()
        .or_else(|| {
            automation.commands.as_ref().map(|cmds| {
                cmds.iter()
                    .map(|c| c.command.clone())
                    .collect::<Vec<_>>()
                    .join("\n")
            })
        })
        .ok_or("No script or commands provided")?;
    
    let validation = {
        let validator = state.validator.lock().map_err(|e| e.to_string())?;
        validator.validate_script(&script_to_validate)
    };
    
    // Check if safe to execute
    match validation {
        Ok(result) if result.is_safe || result.threat_level <= ThreatLevel::Low => {
            let executor = CommandExecutor::new();
            executor.execute_automation(automation, Some(window)).await
        }
        Ok(result) => {
            Err(format!(
                "Automation blocked - Threat level: {:?}. Warnings: {}",
                result.threat_level,
                result.warnings.join(", ")
            ))
        }
        Err(e) => Err(format!("Validation failed: {}", e)),
    }
}
