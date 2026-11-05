package br.com.caixu.service;

import org.springframework.stereotype.Service;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class SenhaService {
    private static final String FORMATO = "pbkdf2-v1";
    private static final int ITERACOES = 600_000;
    private static final int BYTES_SALT = 16;
    private static final int BITS_HASH = 256;

    private final SecureRandom random = new SecureRandom();

    public String gerarHash(String senha) {
        byte[] salt = new byte[BYTES_SALT];
        random.nextBytes(salt);

        byte[] hash = calcularHash(senha, salt);
        Base64.Encoder encoder = Base64.getEncoder();

        return FORMATO + "$" + encoder.encodeToString(salt) + "$" + encoder.encodeToString(hash);
    }

    public boolean verificar(String senhaDigitada, String valorSalvo) {
        if (senhaDigitada == null || valorSalvo == null) {
            return false;
        }

        String[] partes = valorSalvo.split("\\$", -1);
        if (partes.length != 3 || !FORMATO.equals(partes[0])) {
            return false;
        }

        try {
            Base64.Decoder decoder = Base64.getDecoder();
            byte[] salt = decoder.decode(partes[1]);
            byte[] hashSalvo = decoder.decode(partes[2]);

            if (salt.length != BYTES_SALT || hashSalvo.length != BITS_HASH / 8) {
                return false;
            }

            byte[] hashCalculado = calcularHash(senhaDigitada, salt);
            return MessageDigest.isEqual(hashSalvo, hashCalculado);
        } catch (IllegalArgumentException e ) {
            return false;
        }
    }

    private byte[]  calcularHash(String senha, byte[] salt) {
        PBEKeySpec spec = new PBEKeySpec(
                senha.toCharArray(), salt, ITERACOES, BITS_HASH
        );

        try {
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            return factory.generateSecret(spec).getEncoded();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Não foi possível calcular o hash da senha",e);
        } finally {
            spec.clearPassword();
        }
    }
}
