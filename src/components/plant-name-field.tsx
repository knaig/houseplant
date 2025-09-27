'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  generateSmartSuggestions, 
  validatePlantName, 
  isNameUnique,
  normalizePlantName,
  getRandomSuggestion
} from '@/lib/name-generator';
import { CheckCircle, XCircle, RefreshCw, Sparkles } from 'lucide-react';

interface PlantNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  speciesCommonName?: string;
  personality?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

interface ValidationState {
  valid: boolean;
  message?: string;
}

export function PlantNameField({
  value,
  onChange,
  speciesCommonName,
  personality,
  disabled = false,
  placeholder = "Enter a fun name for your plant...",
  className = ""
}: PlantNameFieldProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [validationState, setValidationState] = useState<ValidationState>({ valid: true });
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  // Fetch existing plant names on component mount
  useEffect(() => {
    const fetchExistingNames = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/plants/names');
        if (response.ok) {
          const data = await response.json();
          setExistingNames(data.names || []);
        } else if (response.status === 401) {
          // User not authenticated, that's fine for claim flow
          setExistingNames([]);
        }
      } catch (error) {
        console.error('Error fetching existing names:', error);
        // Don't fail the component if we can't fetch names
        setExistingNames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingNames();
  }, []);

  // Generate initial suggestions
  useEffect(() => {
    if (speciesCommonName || personality) {
      generateNewSuggestions();
    }
  }, [speciesCommonName, personality]);

  // Debounced validation
  useEffect(() => {
    if (!value.trim()) {
      setValidationState({ valid: true });
      return;
    }

    const timeoutId = setTimeout(() => {
      validateName(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, existingNames]);

  const generateNewSuggestions = useCallback(() => {
    setIsGeneratingSuggestions(true);
    try {
      const newSuggestions = generateSmartSuggestions(speciesCommonName, personality);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }, [speciesCommonName, personality]);

  const validateName = (name: string) => {
    const normalizedName = normalizePlantName(name);
    
    // Check format validation
    const formatValidation = validatePlantName(normalizedName);
    if (!formatValidation.valid) {
      setValidationState({
        valid: false,
        message: formatValidation.reason
      });
      return;
    }

    // Check uniqueness
    if (!isNameUnique(normalizedName, existingNames)) {
      setValidationState({
        valid: false,
        message: `You already have a plant named "${normalizedName}"`
      });
      return;
    }

    setValidationState({ valid: true });
  };

  const handleSuggestionClick = (suggestion: string) => {
    const normalizedSuggestion = normalizePlantName(suggestion);
    onChange(normalizedSuggestion);
    setShowSuggestions(false);
  };

  const handleRandomSuggestion = () => {
    const randomSuggestion = getRandomSuggestion(speciesCommonName, personality);
    const normalizedSuggestion = normalizePlantName(randomSuggestion);
    onChange(normalizedSuggestion);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleRefreshSuggestions = () => {
    generateNewSuggestions();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input field with validation feedback */}
      <div className="relative">
        <div className="relative">
          <Input
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            disabled={disabled || loading}
            className={`pr-10 ${validationState.valid ? 'border-green-500' : 'border-red-500'}`}
          />
          {/* Validation icon */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
            ) : validationState.valid && value.trim() ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : !validationState.valid && value.trim() ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : null}
          </div>
        </div>

        {/* Validation message */}
        {validationState.message && (
          <p className={`text-sm mt-1 ${
            validationState.valid ? 'text-green-600' : 'text-red-600'
          }`}>
            {validationState.message}
          </p>
        )}
      </div>

      {/* Suggestions section */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Name Suggestions
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshSuggestions}
              disabled={isGeneratingSuggestions}
              className="text-xs"
            >
              {isGeneratingSuggestions ? (
                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              More
            </Button>
          </div>

          {/* Suggestion pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={`${suggestion}-${index}`}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={disabled}
                className="text-xs h-8 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
              >
                {suggestion}
              </Button>
            ))}
          </div>

          {/* Random suggestion button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRandomSuggestion}
              disabled={disabled}
              className="text-xs text-gray-600 hover:text-green-600"
            >
              🎲 Surprise me with a random name
            </Button>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Choose from suggestions or create your own unique name</p>
        <p>• Names must be 2-50 characters and unique in your collection</p>
        {speciesCommonName && (
          <p>• Suggestions are tailored to your {speciesCommonName}</p>
        )}
        {personality && (
          <p>• Names match your {personality.toLowerCase()} personality</p>
        )}
      </div>
    </div>
  );
}
