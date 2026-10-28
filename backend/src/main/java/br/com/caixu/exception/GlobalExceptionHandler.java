package br.com.caixu.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import br.com.caixu.exception.InvalidCredentialsException;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> tratarNaoEncontrado(
            ResourceNotFoundException exception,
            HttpServletRequest request
    ) {
        return criarResposta(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(OwnershipException.class)
    public ResponseEntity<ErrorResponse> tratarProprietario(
            OwnershipException exception,
            HttpServletRequest request
    ) {
        return criarResposta(
                HttpStatus.FORBIDDEN,
                exception.getMessage(),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> tratarValidacao(
       MethodArgumentNotValidException exception,
       HttpServletRequest request
    ) {
        String mensagem = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error ->
                    error.getField() + ": " + error.getDefaultMessage()
                )
                .collect(Collectors.joining("; "));
        return criarResposta(
                HttpStatus.BAD_REQUEST,
                mensagem,
                request.getRequestURI()
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> tratarConflito(
            DataIntegrityViolationException exception,
            HttpServletRequest request
    ) {
        return criarResposta(
          HttpStatus.CONFLICT,
          "Não foi possivel gravar os dados. Verifique se o e-mail já está cadastrado!",
          request.getRequestURI()
        );
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> tratarCredenciais(
            InvalidCredentialsException exception,
            HttpServletRequest request
    ) {
        return criarResposta(
                HttpStatus.UNAUTHORIZED,
                exception.getMessage(),
                request.getRequestURI()
        );
    }

    private ResponseEntity<ErrorResponse> criarResposta(
            HttpStatus status,
            String mensagem,
            String caminho
    ) {
        ErrorResponse resposta = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                mensagem,
                caminho
        );

        return ResponseEntity.status(status).body(resposta);
    }
}
