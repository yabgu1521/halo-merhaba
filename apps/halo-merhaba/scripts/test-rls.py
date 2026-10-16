"""Disposable local PostgreSQL only; never uses a DATABASE_URL or a remote project."""
import os,subprocess,time,pathlib,sys
name='halo-merhaba-rls-test-'+str(os.getpid())
env=os.environ.copy()
for key in ['DOCKER_HOST','DOCKER_CONTEXT','DOCKER_TLS','DOCKER_TLS_VERIFY','DOCKER_CERT_PATH']:env.pop(key,None)
base=['docker','--host=unix:///var/run/docker.sock']
def run(args,input=None):
 result=subprocess.run(base+args,env=env,input=input,text=True,capture_output=True)
 if result.returncode:raise RuntimeError(result.stderr[:2000] or result.stdout[:2000])
 return result.stdout
try:
 run(['run','--detach','--rm','--network','none','--name',name,'-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:17-alpine'])
 for _ in range(120):
  result=subprocess.run(base+['exec',name,'pg_isready','-U','postgres'],env=env,capture_output=True)
  logs=subprocess.run(base+['logs',name],env=env,capture_output=True,text=True)
  if result.returncode==0 and 'PostgreSQL init process complete; ready for start up.' in logs.stdout:break
  time.sleep(.3)
 else:raise RuntimeError('Local test database did not become ready')
 for file in ['tests/rls-bootstrap.sql','supabase/migrations/202610160001_halo_leads.sql','tests/rls.test.sql']:
  result=run(['exec','-i',name,'psql','-U','postgres','-v','ON_ERROR_STOP=1','-q'],pathlib.Path(file).read_text())
 print('PASS: isolated PostgreSQL migration and RLS checks; no remote database accessed.')
except Exception as error:
 print('FAIL: '+str(error));sys.exit(1)
finally:
 subprocess.run(base+['rm','-f',name],env=env,capture_output=True)
