export const useKeyboardShortcuts = (
  isEditing: boolean,
  hasUnsavedChanges: boolean,
  onSave: () => void,
  onToggleEditing: () => void,
  onEscape: () => void
) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (hasUnsavedChanges) {
        onSave();
      }
    }
    
    // Escape to close editor
    if (e.key === 'Escape' && isEditing) {
      onEscape();
    }
    
    // Ctrl+E or Cmd+E to toggle edit mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      onToggleEditing();
    }
  };

  return handleKeyDown;
};