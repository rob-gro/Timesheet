package dev.robgro.timesheet.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Getter
public class ValidationException extends BaseApplicationException {

    private final List<ValidationError> validationErrors;

    public ValidationException(String message, List<ValidationError> validationErrors) {
        super(message, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
        this.validationErrors = validationErrors != null
                ? Collections.unmodifiableList(validationErrors)
                : Collections.emptyList();
    }

    public ValidationException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
        this.validationErrors = Collections.emptyList();
    }

    public ValidationException(String field, String errorMessage) {
        super("Validation failed for field: " + field, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
        List<ValidationError> errors = new ArrayList<>();
        errors.add(ValidationError.builder().field(field).message(errorMessage).build());
        this.validationErrors = Collections.unmodifiableList(errors);
    }
}
