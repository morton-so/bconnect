package to.bconnect.api.attachment.infrastructure.s3;

import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import to.bconnect.api.attachment.domain.FileStorage;
import to.bconnect.api.attachment.domain.ObjectHead;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RestController
@Profile({"local", "test"})
public class LoggingFileStorage implements FileStorage {

    private static final String UPLOAD_PATH = "/local-storage";

    private final Map<String, ObjectHead> objects = new ConcurrentHashMap<>();

    @Override
    public String presign(String key, String contentType, Duration ttl) {
        log.info("Presign skipped. key={}, contentType={}, ttl={}", key, contentType, ttl);
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(UPLOAD_PATH + "/" + key)
                .toUriString();
    }

    /** 로컬 파일 업로드용 */
    @PutMapping(UPLOAD_PATH + "/{*key}")
    public void upload(@PathVariable String key,
                       @RequestHeader(HttpHeaders.CONTENT_TYPE) String contentType,
                       @RequestBody byte[] body) {
        val head = new ObjectHead(contentType, (long) body.length);
        objects.put(key.substring(1), head);
    }

    @Override
    public Optional<ObjectHead> head(String key) {
        return Optional.ofNullable(objects.get(key));
    }

    @Override
    public void delete(String key) {
        objects.remove(key);
    }

    @Override
    public void deleteAll(List<String> keys) {
        keys.forEach(objects::remove);
    }
}
